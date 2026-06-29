---
name: plan-milestone
description: Use ONLY when the user explicitly types `$plan-milestone <milestone-or-feature-idea>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/plan-milestone/SKILL.md` (skill 신설 근거: ADR-051). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`, `context-pack:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/plan-milestone`·`/plan-workitem`·`/bootstrap-design`·`/discover-product` 등 표기는 Claude 슬래시 커맨드다. Codex에서는 `$plan-milestone` 등으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/plan-workitem F-002`" → Codex 응답에서는 "다음 단계: `$plan-workitem F-002`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

**Sub-agent parity**: 본문 R2의 architect 단발 sub-call은 Claude `Agent` 도구 기능이다. Codex는 sub-agent 병렬 parity가 없으므로 메인 세션이 순차 단일 실행으로 직접 추론한다(degrade — SKILL.md 본문의 Codex 노트 정합).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
