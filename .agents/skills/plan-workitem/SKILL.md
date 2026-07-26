---
name: plan-workitem
description: Use ONLY when the user explicitly types `$plan-workitem <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/plan-workitem/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/plan-workitem` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$plan-workitem`으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/finalize-workitem T-001`" → Codex 응답에서는 "다음 단계: `$finalize-workitem T-001`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
