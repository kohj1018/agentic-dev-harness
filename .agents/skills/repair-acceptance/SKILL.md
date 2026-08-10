---
name: repair-acceptance
description: Use ONLY when the user explicitly types `$repair-acceptance <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-acceptance/SKILL.md` (skill 신설 근거: ADR-066 D4). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/repair-acceptance` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$repair-acceptance`로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/accept-milestone M1`" → Codex 응답에서는 "다음 단계: `$accept-milestone M1`").

**Codex degrade**: 서브에이전트 위임 없이 메인 세션이 순차 단일 실행한다(판정 결과 동일).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
