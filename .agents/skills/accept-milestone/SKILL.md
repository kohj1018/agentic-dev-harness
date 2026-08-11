---
name: accept-milestone
description: Use ONLY when the user explicitly types `$accept-milestone <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/accept-milestone/SKILL.md` (skill 신설 근거: ADR-066). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/accept-milestone` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$accept-milestone`으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/repair-acceptance M1`" → Codex 응답에서는 "다음 단계: `$repair-acceptance M1`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

**Codex degrade — 환경 기동**: 백그라운드 장기 프로세스 기동 parity가 없어 R1에서 환경을 대행 기동하지 않는다. **정확한 명령 시퀀스를 출력해 사용자가 직접 실행**하도록 안내하고 R2로 계속한다(R2~R6와 task 스코프 동작은 동일).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
