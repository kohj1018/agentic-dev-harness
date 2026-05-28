# ADR-043 — Optional MCP Connectors 정책

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] 이 보일러플레이트의 `.codex/config.toml`에는 `[mcp_servers.*]` 설정이 없고, 보일러플레이트 문서/스킬도 MCP 연결을 전혀 인식하지 않는다 — JetBrains 등 외부 MCP를 환경에 붙여도 기록·정책 자리가 없다.
- [외부실증] MCP spec(resources/prompts/tools, JSON-RPC), Claude Code MCP docs(이슈트래커·모니터링·DB·디자인 도구 등 반복 붙여넣는 외부 컨텍스트를 MCP로 대체). Claude Code는 `claude mcp add --scope local|project|user`(project=공유 `.mcp.json`).
- [외부실증] MCP 보안 — tool poisoning / prompt injection / cross-tool leakage; Playwright `browser_run_code_unsafe`는 RCE-equivalent.

## 결정
1. **기본 자동 연결 X** — 보안/권한/비용. 정적 설치 레시피를 보일러플레이트에 baking하지 않는다(생태계가 월 단위로 변함).
2. **`docs/00-meta/STACK_SETUP_PLAN.md`에 "## Optional MCP Connectors" 섹션** — 연결한 MCP별로: purpose / official docs URL / scope(user|project) / **read-only default** / secret handling(.env, 절대 커밋 X) / smoke check / last-verified date.
3. **짧은 common-MCP 카테고리 표**(버전 미고정, "언제 원하나"만): Playwright(브라우저 E2E), DB(스키마 introspection), GitHub(PR/issue), 공식문서(impl 중 최신 API), 분석(PostHog 등), 디자인(Figma), 에러추적(Sentry). 설치 명령은 박지 않음.
4. **전용 skill 없이 *연결 절차*로 처리** (ADR-006 단순성): (a) researcher(ADR-040)로 해당 능력의 *최신 공식 MCP 설정* 조회, (b) **Claude(`claude mcp add ... --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.*]`) 양쪽 설정**을 사용자가 직접 실행(외부·권한 행위), (c) project ADR(`ADR-1NN`)에 MCP 의존+왜+read-only 기록 + project README 인덱스 갱신, (d) STACK_SETUP_PLAN Optional Connectors 섹션 갱신. **skill/agent 본문 자동 재작성 X**(drift 위험 — 수동 채택). 본 절차는 STACK_SETUP_PLAN 섹션 주석에 체크리스트로 박는다.
5. 기존 JetBrains MCP(`.codex/config.toml`에 있으면)는 Optional Connectors 섹션에 backfill 권장.

## 근거
- cross-tool parity(ADR-010): 사용자가 Claude + Codex 양쪽을 쓰므로 둘 다 emit. read-only 기본·secret 분리로 MCP 보안 리스크 완화.
- 전용 skill 대신 절차 문서로 표면적·context 비용 절감(ADR-006 단순성).

## 결과
- STACK_SETUP_PLAN.md Optional MCP Connectors 섹션(표 + 연결 절차 체크리스트). 전용 skill·새 agent 없음(researcher 재사용).

## Ratchet 강도 (ADR-022)
- enabling(약) + 보안 가드(read-only default / secret 분리 = constraint 약).

## 참고
- ADR-010(multi-tool parity), ADR-040(researcher 조회), ADR-025(권장만), GUARDRAILS_STRATEGY(OS·런타임 종속 자동화 강제 X).
