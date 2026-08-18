# ADR-025 — 외부 의존 권장 + CI workflow 권장

> scope: boilerplate

## Status
accepted

## 배경
- [외부실증] Docker Compose + localstack/MinIO — 로컬 외부 의존 부트업 표준화 패턴.
- [외부실증] GitHub Actions validate workflow — CI fail로 검증 누락 방지.
- 현재 `/bootstrap-stack`이 외부 의존(DB/Redis/S3) 부트업 절차를 출력하지 않음.
- `/stack-guard`가 CI workflow를 권장하지 않음.

## 결정

### 1. `/bootstrap-stack` 외부 의존 권장 출력
스택 감지 시 외부 의존 부트업 권장:
- Postgres → `docker-compose.yml` 또는 `supabase start`
- Redis → `docker-compose.yml`
- S3 → localstack 또는 MinIO

### 2. `/stack-guard` CI workflow 권장 출력
`.github/workflows/validate.yml` 형식 권장 텍스트 출력 (파일 자동 생성 X). 사용자가 결정.

## 적용 원칙
- **강제 X, 권장만** — GUARDRAILS_STRATEGY "OS/셸 종속 hook 강제 X" 정신 정합.
- 채택 시 README에 1단락 + 통합 진입점(make dev / pnpm dev) wiring.

## 결과
- 외부 의존 부트업 절차가 최초 설정 시 문서화됨.
- CI fail이 로컬 validate와 동일 기준으로 잡힘.

## 후속 작업
없음

## 참고
- GUARDRAILS_STRATEGY.md
- ADR-022 (Ratchet Principle — [외부실증] 라벨)
- ADR-052 (stack install provision + E2E readiness — ADR-025 "강제 X 권장만" stance를 toolchain install로 확장)

<a id="adr-025-amend-1"></a>
## Amendment 1 (2026-08-18) — CI workflow 기본 생성 (환경 판정 시)

### 배경
- [관측됨] agentic coding에서 로컬 `validate`를 실행하는 주체가 에이전트 자신이다. CI는 그 판정의 **독립 재실행**이 일어나는 유일한 자리이며, 이는 ADR-063(검증 장치의 실측 검증) 정신과 정합한다.
- 결정 2의 «권장 텍스트만 출력»은 환경을 알 수 없던 시점의 보수적 기본값이었다. `/stack-guard`는 스택과 git remote를 실측하므로 환경을 안다.

### 결정
- 결정 2를 다음으로 대체한다: **git remote가 GitHub이고 스택 판정이 끝났으면 `.github/workflows/validate.yml`을 기본 생성**하고, `--no-ci`로만 opt-out한다. 선택 결과를 `STACK_SETUP_PLAN.md`에 기록한다.
- 두 조건 중 하나라도 거짓이면 기존대로 권장 텍스트만 출력한다 — **환경을 모르는 곳에 파일을 만들지 않는다**(GUARDRAILS "환경 종속 hook 강제 X" 정합).
- 기존 파일은 덮어쓰지 않는다.

### 강도 (ADR-022)
- enabling(약) — 기본값 방향 전환이며 차단은 없다.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
