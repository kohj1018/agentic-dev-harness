---
name: boilerplate-context
description: Use when working in this repository to understand the boilerplate's layered documentation system, workitem flow, and guardrail philosophy.
user-invocable: false
---

이 저장소는 Claude Code용 문서 중심 보일러플레이트다.

핵심 구조와 산출물 인벤토리: [docs/00-meta/STRUCTURE.md](../../../docs/00-meta/STRUCTURE.md)
워크플로우와 문서 상태 전이: [docs/00-meta/WORKFLOW.md](../../../docs/00-meta/WORKFLOW.md)
에이전트 위임 전략: [docs/00-meta/DELEGATION_STRATEGY.md](../../../docs/00-meta/DELEGATION_STRATEGY.md)
Guardrail 원칙: [docs/00-meta/GUARDRAILS_STRATEGY.md](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)

기본 진입점:
- 프로젝트 초기 세팅이 필요하면 `/bootstrap-project`를 우선 사용한다.
- 스택 자동화 세팅이 필요하면 `/bootstrap-stack`을 사용한다.

**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — Codex에서는 "Follow `.claude/skills/boilerplate-context/SKILL.md`"로 호출한다(목록 SSOT = README, ADR-010#amend-3·#amend-4).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
