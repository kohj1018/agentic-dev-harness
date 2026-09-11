---
name: design-milestone
description: Use ONLY when the user explicitly types `$design-milestone M<N>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/design-milestone/SKILL.md` (skill 신설 근거: ADR-072). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/design-milestone`·`/plan-milestone`·`/plan-workitem`·`/stack-guard`·`/bootstrap-design` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$design-milestone` 등으로 읽고 사용자에게 안내한다.

**Sub-agent parity**: 본문의 designer·builder·reviewer·researcher 단발 sub-call은 Claude `Agent` 도구 기능이다. Codex에서는 메인 세션이 각 persona 파일을 읽고 순차 인라인 수행하며, 생성→감사 전환을 명시적 단계로 끊고 `under-verified: 동일 세션 감사`를 산출물에 적는다(ADR-058 D5). 게이트·캡처 명령은 그대로 실행한다.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
