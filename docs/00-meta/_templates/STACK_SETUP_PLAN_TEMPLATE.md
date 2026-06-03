# Stack Setup Plan
<!-- 본 파일은 /bootstrap-stack이 docs/00-meta/STACK_SETUP_PLAN.md를 *최초 생성*할 때 복사하는 template.
     baseline에는 본 template만 존재. 실제 STACK_SETUP_PLAN.md는 스택 결정 후 생성된다. -->

> 모드: Reference (스택 설정 절차 + 자동화 권장)

## 외부 의존 부트업 (DB / Redis / S3 등, ADR-025)
`/bootstrap-stack`이 스택 감지 시 다음 권장 출력:
- Postgres: `docker-compose.yml` 또는 `supabase start` 권장.
- Redis: `docker-compose.yml` 권장.
- S3: localstack 또는 MinIO 권장.

사용자가 채택 시 README에 1단락 + `make dev` / `pnpm dev` 등의 통합 진입점에 wiring.

## 통합 명령 사용법
스택 확정 후 `/stack-guard`가 생성하는 통합 검증 명령:
```
pnpm validate   # 또는 npm run validate / make validate / task validate
```

## CI 권장 출력 (ADR-025)
`/stack-guard`가 다음 형식의 권장 텍스트 출력 (파일 자동 생성 X — 사용자 결정):

```yaml
# .github/workflows/validate.yml (권장)
name: validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: <stack의 validate 명령>
```

GUARDRAILS_STRATEGY *"OS/셸 종속 hook 강제 X"* 정신 — 권장만.

## Optional MCP Connectors
<!-- 기본 자동 연결 X (ADR-043). RCE급 도구(예: Playwright browser_run_code_unsafe)는 신뢰 클라이언트 한정. secret은 .env(커밋 X).
     연결 절차(ADR-043 + ADR-048, 전용 skill 없음 — 1회성 셋업): (a) researcher(ADR-040)로 해당 능력의 최신 공식 MCP 설정 조회; (b) Claude(`claude mcp add <name> --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.<name>]`) 설정을 *사용자가 직접 실행*; (c) project ADR(ADR-1NN)에 purpose/official docs/scope/read-only/secret/왜 기록 + project README 인덱스 갱신; (d) 아래 표에 행 추가;
     (e) **사용 강제 셋업 (ADR-048#d2)**: `lifecycle usage`(어느 phase/skill이 어떤 capability에 이 MCP를 우선 쓰는가) 결정 + `agent access` 부여 — (1) 해당 skill `allowed-tools`에 `mcp__<server>__*` 추가(Claude: SKILL frontmatter / Codex: `.codex/config.toml` permissions) + (2) **acceptEdits 기본 모드는 MCP 호출에 confirm을 요구**하므로(GUARDRAILS) fork sub-agent의 비대화 자율 호출이 필요한 *read-only* MCP 도구를 `.claude/settings(.local).json` `permissions.allow`에도 등재(RCE급 도구는 등재 X). 둘 다 안 하면 plan은 line item만 박고 implement는 `Needs MCP Access`로 멈춘다. read-only default 유지·secret은 .env. -->
| name | purpose | official docs | scope | read-only | secret | lifecycle usage | agent access | smoke check | last-verified |
|------|---------|---------------|-------|-----------|--------|-----------------|--------------|-------------|---------------|
| (예: jetbrains) | IDE 연동 | (URL) | project | - | - | (예: implement — 코드 심볼 조회) | (예: implement-workitem / main-session) | - | - |
