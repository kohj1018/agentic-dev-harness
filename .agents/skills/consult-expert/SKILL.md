---
name: consult-expert
description: Use ONLY when the user explicitly types `$consult-expert <legal|strategy|marketing|data|security> [question]`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/consult-expert/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Sub-agent degrade**: Codex 에서는 `Agent` 위임이 매핑되지 않았으므로 메인 세션이 해당 agent 본문을 **인라인 수행**한다 (designer degrade 와 동형). **파일명은 도메인 인자와 다르다** — 본체 SKILL.md 의 `## 도메인 매핑` 표에서 `agent` 열을 찾아 `.claude/agents/<agent>.md` 를 연다 (`legal`→`counsel.md`, `strategy`→`strategist.md`, `marketing`→`marketer.md`, `data`→`analyst.md`, `security`→`security.md`).

**Slash command translation**: 본문 안의 `/consult-expert` 표기는 Claude 슬래시 커맨드다. Codex 에서는 `$consult-expert` 으로 읽고 사용자에게 안내한다. Codex CLI 는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010. Skill 신설 근거 및 도메인 매핑 정책: ADR-062.
