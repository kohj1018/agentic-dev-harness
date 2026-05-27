---
name: repair-plan
description: Use ONLY when the user explicitly types `$repair-plan <workitem-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-plan/SKILL.md` (skill 신설 근거: ADR-038). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/repair-plan` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$repair-plan`으로 읽고 사용자에게 안내한다. 본문에 등장하는 `/implement-workitem`, `/validate-plan` 표기도 각각 `$implement-workitem`, `$validate-plan`으로 안내. Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
