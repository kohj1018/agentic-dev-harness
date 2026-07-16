# ADR-019 — JIT 컨텍스트 로딩 정책

> scope: boilerplate

## Status
accepted

## 배경
- [외부실증] Anthropic effective context engineering — 매 task마다 모든 ADR/architecture를 fork-load하면 컨텍스트 창 낭비 + 추론 노이즈 증가. 최소 충분(minimal sufficiency) 원칙이 agent 품질 상한을 올린다.
- [관측됨] 각 skill의 "반드시 먼저 읽을 파일" 목록이 *최소 충분*인지 점검 없음 → 과도한 사전 로딩 위험.

## 결정

### 1. JIT 로딩 정책 명문화
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.

모든 skill SKILL.md 본문 끝에 `## Context 정책 (ADR-019)` 섹션으로 명문화.

### 2. Context Packs 2종 (이력 — 폐기됨)

| pack | 포함 | 용도 |
|------|------|------|
| **minimal** *(default)* | AGENTS.md + task 본문 | 모든 일반 skill |
| **full** | 모든 docs/ | architect 디폴트 |

- skill frontmatter에 `context-pack: minimal` 필드 추가 (13개 skill 일괄).
- architect agent frontmatter에 `context-pack: full`.
- [정정 2026-07: 위 두 줄의 frontmatter 필드는 Claude 공식 스키마에 없어 실효 없음(no-op) — 필드는 제거하고 로딩 정책은 결정 1의 본문 JIT 지침으로 일원화한다. 위 §2(표 포함) 전체가 이력 보존용이다.]

## 비결정 (No)
- frontend/backend 영역별 pack 사전 정의 — 과설계. 사용자가 필요 시 fork 프로젝트에서 자체 정의.

## 토큰 절감 추정
- minimal: ~5K / full: ~30K → 호출당 5~25K 절감.

## 결과
- 모든 skill이 JIT 로딩 정책을 명문화 → 과도한 사전 로딩 방지.
- 로딩 범위 제어는 각 skill 본문의 「## Context 정책 (ADR-019)」 JIT 지침이 담당한다(architect·researcher agent는 전용 JIT 섹션 없이 위임 task 범위로 로딩). context-pack frontmatter 필드는 Claude Code 공식 스키마에 없어 실효 없음(no-op)이라 제거됨 — 실효 메커니즘은 본문 JIT 지침(최소 읽기 목록 + 발화 시 인용)이다(2026-07 공식문서 확인).

## 후속 작업
없음

## 참고
- ADR-022 (Ratchet Principle — [외부실증] 라벨)
- ADR-010 (multi-tool 호환)

<a id="adr-019-amend-1"></a>
## Amendment 1 (2026-06-25) — 조건부 re-read (foreman/fan-out inner-loop, ADR-051 D8)

### 결정
foreman/fan-out 도입(ADR-051 D1·D2)으로 메인 세션이 inner-loop를 여러 라운드 운전할 때, minimal/JIT 정책을 *조건부 re-read*로 좁힌다 — **직전 라운드에서 이미 로드한 문서는 변경 신호(mtime 갱신, validate report 신규 생성, task `## 8. 메모` repair 갱신)가 있을 때만 재읽기**. 변경 신호가 없으면 in-context 버전을 재사용하고 재로딩하지 않는다.
- 본 amend는 ADR-019 본래 "사전 fork-load 금지 + minimal" 정신 계승 — *불필요한 재로딩*도 fork-load와 동형의 컨텍스트 낭비로 본다.

### 강도 (ADR-022)
- enabling(약) — 토큰 절감. 변경 신호 판정이 모호하면 *안전하게 재읽기*(false re-read는 비용만, 정확성 무해).

### 적용 surface
- .claude/skills/implement-workitem/SKILL.md   — foreman inner-loop 조건부 re-read (ADR-051 D8)
- .claude/skills/validate-workitem/SKILL.md    — fan-out 라운드 조건부 re-read
- 각 skill 본문 `## Context 정책 (ADR-019)` 단락에 1줄 인용 (ADR-019 #amend-1).
