---
name: repair-milestone
description: Use ONLY when the user explicitly types `$repair-milestone <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-milestone/SKILL.md` (skill 신설 근거: ADR-052). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/repair-milestone` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$repair-milestone`으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/stabilize-milestone M1`" → Codex 응답에서는 "다음 단계: `$stabilize-milestone M1`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

**Codex parity**: 본 skill은 위임하지 않으므로(ADR-068 D1) 병렬 라우팅 자체가 없다 — Codex와 Claude 동작이 같다.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
