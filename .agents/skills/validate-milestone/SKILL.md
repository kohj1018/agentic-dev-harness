---
name: validate-milestone
description: Use ONLY when the user explicitly types `$validate-milestone <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/validate-milestone/SKILL.md` (skill 신설 근거: ADR-054; wrapper 승격: ADR-010#amend-4). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 grep 실측상 실제 슬래시 커맨드는 `/repair-milestone`뿐이므로 이를 `$repair-milestone`으로 안내한다(`/validate-milestone`은 명령이 아니라 skill 이름·경로로만 등장하고, 그 자체 호출은 wrapper `description`의 `$validate-milestone`이 커버). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
