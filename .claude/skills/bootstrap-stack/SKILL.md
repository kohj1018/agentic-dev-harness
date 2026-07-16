---
name: bootstrap-stack
description: Decide or document the project stack, then author stack-specific setup. Input-adaptive — a concrete stack summary is documented directly, empty/vague input triggers deep research-and-rounds decision, --migrate handles a stack change.
argument-hint: "[stack summary → document | empty/vague → deep decision rounds | --migrate [new stack]]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
---

너의 역할은 프로젝트 스택을 *결정하거나 문서화*하고, 이 보일러플레이트에 맞게 stack-specific 초기 세팅 문서를 정리하는 것이다. 스택이 이미 정해졌으면 문서화만, 미정이면 리서치+라운드로 결정까지 운전한다. 정책 SSOT는 ADR-055(입력 적응형 흐름·taxonomy) + ADR-041 D2(--migrate contract).

이 skill은 **메인 세션에서 직접 실행**된다(discover-product/plan-milestone 패턴 — `context: fork` 미지정). 무거운 추론은 `Agent` 도구로 architect/researcher 단발 sub-call에 위임하고 결론만 문서에 반영한다. `disable-model-invocation: true` 유지 — 후속 `/stack-guard`는 텍스트 제안이며 자동 호출하지 않는다(ADR-050 D2).

## R0 — 입력·상태 감지 + 분기 (항상 먼저 수행)
1. **상태 회수(최소)**: `docs/90-decisions/project/ADR-101-stack-selection.md` 존재 여부 + 프로젝트 manifest(`package.json`/`pyproject.toml`/`go.mod`/`Cargo.toml` 등) 존재 여부.
2. **분기**:
   - **`--migrate`** → 아래 `## --migrate (T2) 흐름`.
   - **구체적 스택 감지** — $ARGUMENTS에 아래 "스택별 디폴트 디렉터리 구조" 표나 ARCH §7 sub-section으로 해석되는 프레임워크/언어/런타임 토큰이 1+ 있음, **또는** manifest가 이미 있어 스택이 물질화됨(brownfield) → **BASE 문서화 흐름**. brownfield는 스택을 새로 *결정하지 않고* manifest에서 감지해 문서화·정합한다.
   - **비어 있음/모호/불확실** — $ARGUMENTS가 비었거나, 앱 범주·목표만 있고 해석 가능한 프레임워크 토큰이 없거나("SaaS 하나", "웹앱", "백엔드"), 불확실 마커("추천", "뭐가 좋을까", "골라줘")가 있음 → **DEEP 결정 흐름**.
3. **가드**:
   - **charter/ARCH 얕음** — DEEP인데 `PROJECT_CHARTER §4/5/6/7`·`ARCH §8`이 비었으면 persona·제품 맥락을 *만들지 말고* "먼저 `/discover-product` 또는 `/bootstrap-project`" 안내 후 종료(DISCOVERY=SSOT, ADR-035).
   - **오라우팅 방지** — 프레임워크 토큰이 하나라도 있으면 BASE로 가되, 산출이 §7에 미달(예: API 필요 제품인데 백엔드 미정)이면 "추천을 원하면 스택 없이 재실행" 1줄만 echo — 몰래 라운드로 승격하지 않는다.

반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-101 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-101 추가 후 한 줄 갱신 대상)
- `stack-brief-template.md`
- `output-checklist.md`

## DEEP 결정 흐름 (R1~R4 — 무입력/모호 시)
discover-product 라운드 패턴을 재사용한다. 각 라운드는 압축 포맷으로 출력하고 자연어 응답(`skip`/`good`/`refine: …`)만 받는다:
```
이번 결정: <1~2줄>
확인 필요: <있으면 ≤3개, 없으면 생략>
답변: skip / good / refine: …
```
사용자가 *선택해야 하는* 옵션 목록(2~3 스택 조합)은 압축하지 않고 보존한다(ADR-046#d3). architect/researcher 단발 sub-call의 *과정*은 대화에 풀지 않고 결론만 surface한다. **(Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 R1 researcher·R2 architect 위임을 순차 인라인 추론으로 degrade — ADR-040#amend-3 / ADR-053 정합.)**

**R1 — 요구 grounding + 리서치.** `PROJECT_CHARTER ## 4 목표/## 5 비목표/## 6 성공 기준/## 7 제약` + `ARCH ## 8 품질 속성`(규모·성능·확장 기대)을 읽는다. 최신 프레임워크/버전 지형이 필요하면 `Agent`로 researcher에 직접 위임(ADR-040#amend-3 — bootstrap-stack은 Agent 보유). 결과는 출처·날짜·신뢰도 라벨(ADR-040 §3). **오프라인/미발견이면 날조 금지** — 조합을 `Needs Research`·저신뢰도로 표시하거나 BASE 문서화로 폴백한다.

**R2 — 옵션 + 트레이드오프 + 추천(수렴 루프).** architect 단발 sub-call로 **2~3개 스택 조합**을 서로 다른 각도(MVP/risk/scale-first)로 생성. 각 조합에 (a) 현재 복잡도 (b) 확장·마이그레이션 비용 (c) ADR-031 직접지원 5유형(web frontend/API/CLI/monorepo/Supabase) 정합 (d) 성장 경로("X로 시작 → Y로 성장") + **본 skill의 추천안 + 근거**를 함께 제시(ADR-006 단순성 가중 — 과한 스택 경고). 사용자가 `skip/good/refine`로 응답 → 피드백 시 재생성. **2사이클 미수렴 시 재생성 대신 brief를 고친다**(charter 재독·요구 명확화 — bootstrap-design R2 규칙). 선택 확정 전에는 R3로 진행하지 않는다.

**R3 — 고-stakes 심화(해당 시).** 되돌리기 비싼 §7-3 백엔드 결정(인증·DB·트랜잭션)이 ADR-053 게이트(S1~S4 중 1+)에 걸리면 아래 `## 고-stakes 설계 게이트`의 full 패널을 실행. 저-stakes는 R2 단발 결론. 스택 선택 자체는 R2에서 다뤘으므로 여기선 *별개의* 미해결 reversible 결정에만 발동(중복 발동 회피 — ADR-053 falsifying-eval의 과발동 방지).

**R4 — 저장/실행(절대 건너뛰지 않음).** 확정된 스택으로 아래 `## BASE 문서화 흐름`을 그대로 수행해 모든 산출물을 *한 세션에* 쓴다. R1~R3 근거는 ADR-101의 옵션≥2/신뢰도/재검토 칸에 적재한다.

**누적/단계별 출구:** R1~R3 동안 결론을 draft ADR-101(`## 0. Status: proposed`, **인덱스 미등재**)에 누적한다. 중간에 멈춰도 proposed ADR-101이 남아 재개·`/stack-guard` 입력으로 유효하다. R4 저장 때만 status를 accepted로 올리고 인덱스 행을 추가한다. proposed 상태·미등재를 유지해 stabilize의 §7 backstop 오탐을 막는다.

## BASE 문서화 흐름 (구체적 스택/brownfield, 또는 DEEP R4)
1. 스택 정보를 구조화한다(`stack-brief-template.md` 참조). brownfield면 manifest에서 감지.
2. 아래 문서를 갱신한다.
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md` — **`## 7. 기술 선택`**(고-stakes는 §7 결정 블록: 옵션≥2/신뢰도/재검토) + 해당 **`## 7-1`~`## 7-4`** 컨벤션 + **`## 3-1` 레이어 경계·의존성 규칙에 스택별 디폴트 디렉터리 트리**(아래 표) + `## 7. 기술 선택` 하위 운영 사실(실행 명령/포트/환경변수 이름/핵심 디렉터리 역할/gotcha — `output-checklist.md`).
   - `docs/10-charter/PROJECT_CHARTER.md` **`## 7. 제약 조건`** — 허용 의존 정책 envelope(스택 핵심 라이브러리). T3 dep 판정의 기준선.
   - `docs/90-decisions/project/ADR-101-stack-selection.md` — _ADR_GUIDE 권장 섹션 + 옵션·신뢰도·재검토 칸. **`## 7-1`~`## 7-4` 인터페이스 컨벤션 채움은 architect 단발 sub-call(라운드 아님 — ADR-027#31)**. API 감지 → 7-1+7-3, CLI → 7-2, 프론트 → 7-4.
   - `docs/90-decisions/project/README.md` 인덱스 표에 ADR-101 한 줄 추가.
3. **비해당 `## 7-1`~`## 7-4` 처리 — 단일 스택은 통째 삭제, 다중 스택(monorepo)은 KEEP-list**: 프로젝트가 스택 1종이면 비해당 sub-section을 통째 삭제한다(예: API 미포함 → `## 7-1` 삭제). **FE+API+CLI 등 다중 스택이면 해당하는 sub-section을 *모두 보존*하고 각 스택의 디렉터리 트리를 `## 3-1`에 함께 박는다(삭제 금지).**
4. 필요하면 `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md` 생성(이미 있으면 갱신 제안). **Optional MCP Connectors 백필(ADR-048#d1)**: `.codex/config.toml`에 `[mcp_servers.*]`가 있으면 STACK_SETUP_PLAN `## Optional MCP Connectors` 표에 backfill 권장(자동 연결 X — 사용자 직접).
5. 프론트 스택 감지 시 마지막 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 1줄.

## --migrate (T2) 흐름 — 입력 적응형
스택 *변경*. R0에서 `--migrate`로 진입. contract 규약 소유는 ADR-041 D2, 적응형 진입은 ADR-055. **입력 적응형**:
- **타깃 명시**(`--migrate Nest.js`) 또는 이미 결정 → 옵션 라운드 건너뛰고 계약 authoring 직행.
- **타깃 미정**(`--migrate` 단독 / "뭐로 갈지 모르겠다") → 위 DEEP R1~R2를 *마이그레이션 프레이밍*으로 실행(트레이드오프 축에 **기존 데이터·API 호환성**과 **이전 비용**을 1급 추가) → 타깃 수렴 후 계약.

계약(항상, ADR-041 D2): 새 project ADR `docs/90-decisions/project/ADR-1NN-<migration>.md`에 old/new stack, 호환성(데이터·API·런타임), cutover 순서(expand-contract: 신규 추가 → dual-run → 구식 제거), rollback, validation(완료 판정), hook·verify 갱신 목록을 쓰고, 기존 ADR-101을 `superseded` + 상단 "대체: ADR-1NN". project README 인덱스에 한 줄 추가 + ADR-101 행 상태 superseded 갱신. ARCH §7 결정 블록·§3-1 디렉터리 트리 갱신, charter §7 제약 갱신.
**진행 중 task/worktree 주의**: 마이그레이션은 진행 중 task의 §7 매핑·AC를 무효화할 수 있다. supersede 전에 진행 중 task를 freeze·재검증할 것을 출력에 명시하고, cutover는 `Type:migration` task(ADR-039)로 분해(`/plan-workitem`)한다.
작성 후 안내: `/bootstrap-stack <new stack>`(문서화) → `/stack-guard` 순 재실행.

## 스택 결정 tier (T1/T2/T3 — ADR-055) — 판정 기준
- **T1 기초 스택**(프로젝트 birth): 본 skill의 BASE/DEEP 흐름 → ADR-101 + ARCH §7 + charter §7 제약.
- **T2 물질적 변경/마이그레이션**: ADR-053 S1~S4 중 1+ 해당(언어/런타임/프레임워크/DB·영속성/인증/배포 토폴로지/핵심 외부 의존을 건드림 **또는** ARCH §7 결정·charter §7 제약을 뒤엎음; 개별로 사소해도 *cluster*로 이 선을 넘으면 포함) → 본 skill `--migrate`.
- **T3 라이브러리 추가**(routine): 위 어느 것도 아님 → `/plan-workitem`이 task `## 3` install line-item으로 처리(ADR-040#amend-1). ADR-101 안 건드림. 누적이 T2 선을 넘으면 stabilize의 `[Stack-drift]`가 감지.

반드시 지켜야 할 원칙:
- shared 기본값에 OS/셸 종속 hook를 강제로 넣지 않는다. 대신 필요한 scripts/hooks/CI를 문서로 정리한다.
- 확실하지 않은 환경 전제는 가정으로 표시한다. 추측을 사실처럼 쓰지 않는다.
- 통합 검증 명령(`validate`)·verify 스크립트·hook 등록 안내는 `/stack-guard`가 별도 생성한다 — 다음 단계 안내에 포함.

마지막 출력:
- 스택 선택/문서화 요약 (DEEP면 선택된 조합 + 근거)
- 갱신/생성한 문서 목록
- 추천 guardrail 목록 + 남은 불확실성
- **연결/연결 권장 MCP가 있으면**: STACK_SETUP_PLAN `## Optional MCP Connectors`에 lifecycle usage + agent access 기록 안내 1줄(ADR-048).
- 다음 권장 단계로 `/stack-guard` 안내(자동 호출 아님 — 사용자 발화). 프론트면 `/bootstrap-design`도.

## 외부 의존 부트업 권장 (감지 시 출력, ADR-025)
스택 감지 시(강제 X, 권장만):
- Postgres: `docker-compose.yml` 또는 `supabase start` 권장.
- Redis: `docker-compose.yml` 권장.
- S3: localstack 또는 MinIO 권장.

사용자가 채택 시 README에 1단락 + `make dev` / `pnpm dev` 등의 통합 진입점에 wiring. 상세는 생성될 `docs/00-meta/STACK_SETUP_PLAN.md` 참조.

## monorepo 라운드 (감지 시 자동, ADR-008#amend-1)
1. **orchestrator 결정**: turbo / nx / pnpm workspaces only / lerna 등 1종.
2. **shared 패키지 위치 + 버전 정책**: `packages/shared`, semver vs fixed.
3. **publish 정책**: 외부 publish vs internal-only.
4. **scope vocabulary**: 패키지명 목록을 ADR-008 amend의 scope 컨벤션과 정합화.
> monorepo는 위 `## BASE 문서화 흐름` 3의 다중 스택 KEEP-list를 적용한다(§7-1~7-4 삭제 금지, 패키지별 디렉터리 트리 모두 §3-1에 박음).

## 스택별 디폴트 디렉터리 구조 (권장 출력)

| 스택 | 디폴트 트리 |
|------|-----------|
| Next.js | `app/`, `components/`, `lib/`, `tests/` |
| FastAPI | `app/{api,core,domain,infra}/`, `tests/` |
| Express | `src/{routes,services,domain,infra}/`, `tests/` |
| Rust CLI | `src/{cli,core,...}/`, `tests/` |
| Go CLI | `cmd/`, `internal/{cli,core,...}/`, `tests/` |
| Python CLI | `src/<pkg>/{cli,core,...}/`, `tests/` |

ARCHITECTURE_OVERVIEW.md `## 3-1` 채움 시 함께 박음. 사용자 즉흥 결정 → 스파게티 차단.

## 고-stakes 설계 게이트 (ADR-053)
설계 결정이 ADR-053 게이트(S1~S4 중 1+ → full 패널 / S5만 → 리서치-only / 전부 NO → 단발)면: ① researcher 웹 패스(must-or-flag, 오프라인 `Needs Research`) → ② architect 다각도 2~3안 → ③(S1·S3·S4 중 2+면) 두 번째 architect 적대 검토(review-doc 미사용·parallel-merge 금지, 순차 생성→비평→종합) → ④ ARCHITECTURE §7 결정 블록 기록. 저-stakes는 단발. (Codex: 순차 단일 degrade — researcher 인라인/사전 노트.)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
