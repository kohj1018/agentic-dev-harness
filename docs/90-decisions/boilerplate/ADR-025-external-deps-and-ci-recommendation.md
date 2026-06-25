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
