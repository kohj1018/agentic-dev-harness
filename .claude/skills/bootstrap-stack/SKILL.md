---
name: bootstrap-stack
description: Add stack-specific setup guidance and project automation after the stack and runtime are explicitly chosen.
argument-hint: "[stack and runtime summary]"
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

반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `stack-brief-template.md`
- `output-checklist.md`

반드시 수행할 일:
1. 스택 정보를 구조화한다.
2. 아래 문서를 갱신한다.
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md`
   - `docs/90-decisions/project/ADR-101-stack-selection.md` (project ADR은 100+ 번호 — boilerplate/ADR-003은 legacy reserved)
3. 필요하면 아래 문서를 만든다.
   - `docs/00-meta/STACK_SETUP_PLAN.md`
   - `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md`를 생성 (이미 있으면 갱신 제안만).
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
- 다음 권장 단계로 `/stack-guard`를 안내한다(자동 호출 아님 — 사용자가 발화한다).

## 외부 의존 부트업 권장 (감지 시 출력, ADR-025)
스택 감지 시 외부 의존 부트업 권장 출력 (강제 X, 권장만):
- Postgres: `docker-compose.yml` 또는 `supabase start` 권장.
- Redis: `docker-compose.yml` 권장.
- S3: localstack 또는 MinIO 권장.

사용자가 채택 시 README에 1단락 + `make dev` / `pnpm dev` 등의 통합 진입점에 wiring. 상세 절차는 생성될 `docs/00-meta/STACK_SETUP_PLAN.md` 참조.

## monorepo 라운드 (감지 시 자동, ADR-008 amend 1)
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

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
