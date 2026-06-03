---
name: bootstrap-stack
description: Add stack-specific setup guidance and project automation after the stack and runtime are explicitly chosen.
argument-hint: "[stack and runtime summary | --recommend | --migrate]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
context: fork
agent: architect
model: opus
effort: max
context-pack: minimal
---

너의 역할은 프로젝트 스택이 명확해진 이후, 이 보일러플레이트에 맞게 stack-specific 초기 세팅 문서를 정리하는 것이다.

입력:
- `$ARGUMENTS`에는 언어, 프레임워크, 패키지 매니저, 테스트 도구, 배포 환경 등이 자연어로 들어온다.
- 입력이 짧더라도 `stack-brief-template.md` 구조를 참고해 내부적으로 정리한다.
- **`--recommend`**: 스택 확정 *전* 모드. 아래 `## --recommend 모드` 절차를 따른다 (추천 텍스트만 출력, 파일 생성 X).
- **`--migrate`**: 스택 변경 모드. 아래 `## --migrate 모드` 절차를 따른다 (마이그레이션 contract ADR 작성).

반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-101 작성 시 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-101 추가 후 한 줄 갱신 대상)
- `stack-brief-template.md`
- `output-checklist.md`

반드시 수행할 일 (플래그 없는 기본 모드 한정 — `--recommend`/`--migrate`는 위 입력 라우팅대로 각 모드 섹션 절차가 우선):
1. 스택 정보를 구조화한다.
2. 아래 문서를 갱신한다.
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md`
   - `docs/90-decisions/project/ADR-101-stack-selection.md` (project ADR은 100+ 번호 — boilerplate/ADR-003은 legacy reserved). _ADR_GUIDE.md 권장 섹션 + Ratchet evidence label 정합.
   - **`docs/90-decisions/project/README.md` 인덱스 표에 ADR-101 한 줄 추가** (인덱스 표 컬럼 양식은 `docs/90-decisions/project/README.md` 본문 표 헤더가 SSOT — _ADR_GUIDE.md "새 ADR 추가 절차" §2 정합). `--migrate` 모드와 동일한 형식.
3. 필요하면 아래 문서를 만든다.
   - `docs/00-meta/STACK_SETUP_PLAN.md`
   - `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md`를 생성 (이미 있으면 갱신 제안만).
   - **Optional MCP Connectors 백필 (ADR-048#d1 / ADR-043#d5)**: `.codex/config.toml`에 `[mcp_servers.*]`가 이미 있으면(예: jetbrains) STACK_SETUP_PLAN `## Optional MCP Connectors` 표에 `lifecycle usage`·`agent access` 포함해 backfill 권장. 표는 생성하되 *자동 연결은 하지 않는다*(사용자 직접 — ADR-043 보안).
4. **인터페이스 컨벤션 채움** — API/CLI/백엔드/프론트 컨벤션은 ARCHITECTURE_OVERVIEW.md의 7-1/7-2/7-3/7-4에 박는다.
   - API 스택 감지 시: architect 단발 sub-call로 7-1(API 컨벤션) + 7-3(백엔드 결정) 채움.
   - CLI 스택 감지 시: 같은 방식으로 7-2(CLI 컨벤션) 채움.
   - 프론트 스택 감지 시: 7-4(프론트 결정) 채움. 시각 결정은 `/bootstrap-design`이 별도 처리.
   - 비해당 sub-section은 채우지 않는다. **스택 확정 시 본 skill이 통째 삭제** (가능 안내 X, 명령형 — 다음 step 5 첫 줄 참조).
5. **비해당 7-1~7-4 sub-section 통째 삭제** (필수, 가능 안내 X): ARCHITECTURE_OVERVIEW.md의 비해당 sub-section을 *통째* 삭제한다 (예: API 미포함 프로젝트는 `## 7-1` sub-section 삭제).
   - 프론트 스택 감지 시 마지막 출력에 한 줄 추가: "frontend 감지됨. `/bootstrap-design` 권장".

반드시 지켜야 할 원칙:
- shared 기본값에 OS/셸 종속 hook를 강제로 넣지 않는다.
- 대신 어떤 scripts, hooks, CI가 필요한지 문서로 정리한다.
- 실제 실행 스크립트가 필요한 경우 해당 스택에서 자연스러운 런타임을 기준으로 제안한다.
- 확실하지 않은 환경 전제는 가정으로 표시한다.

마지막 출력:
- 스택 선택 요약
- 추천 guardrail 목록
- 생성/추가가 필요한 문서 목록
- 남은 불확실성
- **연결된/연결 권장 MCP가 있으면**: `STACK_SETUP_PLAN.md ## Optional MCP Connectors`에 lifecycle usage + agent access 기록 안내 1줄 (ADR-048).
- 다음 권장 단계로 `/stack-guard`를 안내한다(자동 호출 아님 — 사용자가 발화한다).

## 외부 의존 부트업 권장 (감지 시 출력, ADR-025)
스택 감지 시 외부 의존 부트업 권장 출력 (강제 X, 권장만):
- Postgres: `docker-compose.yml` 또는 `supabase start` 권장.
- Redis: `docker-compose.yml` 권장.
- S3: localstack 또는 MinIO 권장.

사용자가 채택 시 README에 1단락 + `make dev` / `pnpm dev` 등의 통합 진입점에 wiring. 상세 절차는 생성될 `docs/00-meta/STACK_SETUP_PLAN.md` 참조.

## monorepo 라운드 (감지 시 자동, ADR-008#amend-1)
1. **orchestrator 결정**: turbo / nx / pnpm workspaces only / lerna 등 1종.
2. **shared 패키지 위치 + 버전 정책**: `packages/shared`, semver vs fixed.
3. **publish 정책**: 외부 publish vs internal-only.
4. **scope vocabulary**: 패키지명 목록을 ADR-008 amend의 scope 컨벤션과 정합화.

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

## --recommend 모드 (ADR-041)
스택 확정 *전* 호출. architect로서 다음을 수행:
1. `docs/10-charter/PROJECT_CHARTER.md` `## 6 목표`/`## 7 비목표`/`## 8 성공 기준`/`## 9 제약`, `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 8 품질 속성`을 읽어 요구·규모·확장 기대를 파악.
2. (옵션) 최신 프레임워크/라이브러리 지형이 필요하면 *먼저* `/research-pack <스택 후보 주제>`를 돌려 insights 노트를 만들어 두고 본 모드가 이를 참조한다 — 지식 컷오프 보완. (bootstrap-stack은 fork+Agent 미보유라 본 skill에서 직접 researcher 위임은 불가.)
3. **2~3개 스택 조합**을 제시. 각 조합: (a) 현재 복잡도, (b) 확장·마이그레이션 비용, (c) ADR-031 직접지원 5유형(web frontend/API/CLI/monorepo/Supabase) 정합, (d) 마이그레이션 경로("X로 시작 → Y로 성장 가능").
4. **ADR-006 단순성 가중** — 요구에 비해 과한 스택이면 명시 경고. prototype은 가장 단순한 조합 우선.
5. 출력은 *추천 텍스트만*. 파일 생성 X. 사용자가 선택하면 `/bootstrap-stack <선택한 스택>`(플래그 없이)로 본 흐름 진행 안내.

## --migrate 모드 (ADR-041)
스택 변경 시 호출. 다음 contract를 새 project ADR(`docs/90-decisions/project/ADR-1NN-<migration>.md`, 기존 ADR-101 stack-selection을 `superseded` 처리 + 상단 "대체: ADR-1NN")로 작성:
- **old stack / new stack**
- **호환성**: 데이터·API·런타임 호환 이슈
- **cutover 순서**: expand-contract(신규 추가 → 양쪽 dual-run → 구식 제거) 단계
- **rollback**: 되돌리기 절차
- **validation**: 마이그레이션 완료 판정 기준
- **hook·verify 갱신 목록**: `/stack-guard` 재실행으로 갱신할 verify 스크립트·도구(도구 감지 우선순위로 기존 도구 보존 — stack-guard SKILL "도구 감지 우선 순서" 참조)
작성한 project ADR은 **`docs/90-decisions/project/README.md` 인덱스에 한 줄 추가**(인덱스 표의 현재 컬럼 형식에 맞춰 — Step 12 적용 시 area·last-reviewed 포함). 기존 ADR-101을 supersede하면 그 행 상태도 `superseded`로 갱신.
작성 후 안내: `/bootstrap-stack <new stack>` → `/stack-guard` 순으로 재실행. 마이그레이션 cutover 작업은 `Type: migration` task(ADR-039)로 분해(`/plan-workitem`).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
