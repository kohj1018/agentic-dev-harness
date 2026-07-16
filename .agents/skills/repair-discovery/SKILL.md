---
name: repair-discovery
description: Use ONLY when the user explicitly types `$repair-discovery`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-discovery/SKILL.md` (skill 신설 근거: ADR-044; wrapper 승격: ADR-010#amend-4). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 grep 실측상 마지막 출력·비교 문맥에 등장하는 슬래시 커맨드 5개를 각각 치환해 안내한다 — `/validate-discovery`→`$validate-discovery`, `/bootstrap-project`→`$bootstrap-project`, `/plan-milestone`→`$plan-milestone`, `/plan-workitem`→`$plan-workitem`, `/repair-plan`→`$repair-plan`. Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
