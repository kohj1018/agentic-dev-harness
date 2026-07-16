---
name: validate-discovery
description: Use ONLY when the user explicitly types `$validate-discovery [--reviewer-tag <tag>]`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/validate-discovery/SKILL.md` (skill 신설 근거: ADR-044; wrapper 승격: ADR-010#amend-4). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 grep 실측상 실제 슬래시 커맨드는 `/repair-discovery`·`/validate-plan` 2개다 — 각각 `$repair-discovery`·`$validate-plan`으로 안내한다. `/discover-product`는 wrapper 미보유 skill이므로 "Follow `.claude/skills/discover-product/SKILL.md`" 자연어 호출로 안내한다. 자기 이름 `/validate-discovery` 표기는 본문에 없음(등장 시 `$validate-discovery`로 추가 안내). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
