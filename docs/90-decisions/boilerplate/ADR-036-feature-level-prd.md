# ADR-036 — FEATURE_TEMPLATE 12섹션 PRD 강화

> scope: boilerplate

## Status
accepted

> **정합 표기 (2026-07-29)**: [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D1이 FEATURE_TEMPLATE `## 12. 열린 질문`을 폐지(결번)하므로 본 ADR의 "12섹션"은 **`## 1`~`## 11` 11섹션 + 결번 12**가 된다. 섹션 번호는 재사용하지 않으며, "추가 main section 신설 X" 규율은 불변이다.

## 배경
- [관측됨+외부실증] Osmani 6 core (User Story / Scenario / AC / NFR / Edge Cases / Dependencies) + ChatPRD 6 sections — feature 단위 user story+AC를 spec 단계에서 박는 게 LLM 구현 품질의 핵심.
- [관측됨] 본 보일러플레이트의 FEATURE_TEMPLATE은 10섹션이지만 User Story 형식·시나리오·Feature-level AC·NFR 자리 부재 → AI agent가 implement 시 *who·why·시나리오 측정 기준* 부족.
- spec-kit/Kiro/ChatPRD가 feature 단위 user story+AC를 spec 단계에서 박는데 본 보일러플레이트는 task 단계만 박음.

## 결정

### 1. FEATURE_TEMPLATE 12섹션 (기존 10 → 신설·재구성)
- `## 2 사용자 가치` → **User Story 형식 강제** ("As a <persona>, I want to <goal>, so that <benefit>.")
- `## 3 핵심 시나리오 (Feature-level)` **신설** — happy/alternate/fail 각 3~5단계.
- `## 7 Feature-level Acceptance Criteria` **신설** — FAC-1, FAC-2 ... 시나리오 수준 측정 기준. 구 `## 8 검증 방법` 흡수.
- `## 8 Non-functional Requirements` **신설** — 성능·접근성·보안·i18n.
- 기존 `## 3 범위` → `## 4`, `## 4 비범위` → `## 5`, 이하 순차 재번호.

### 2. plan-workitem FAC↔AC 매핑 강제
feature 분해 시 `## 7 FAC`는 task `## 6 AC`로 분해되며 매핑 누락 시 plan 출력의 "남은 미결정 사항"에 명시.

### 3. AGENTS.md 핵심 행동 규율 boundaries 3-tier 라벨링
기존 6개 규율에 Osmani 3-tier (✅Always/⚠️Ask/🚫Never) 라벨 추가. 항목 추가 0개 — cap 보호.

## --fast 회피 보장
prototype은 신설 3섹션(## 3 / ## 7 / ## 8)을 1줄씩만 채워도 OK ("해당 없음" / "M2 이후 검토"). YAGNI 정합.

## 비결정 (영구 No)
- 자체 발명 PRD 양식 — 외부 표준 학습 비용 0, ADR-005 SSOT 위반.
- spec-kit `constitution.md` 별도 파일 추가 — AGENTS.md + ADR-006 단순성 정책이 동등 매핑. ADR-005 진입 페이지 1개 정책 + ADR-010 IDE lock-in 회피와 정합.

## 결과
- feature 단위 spec이 구체화되어 AI agent의 첫 구현 품질이 향상됨.
- task AC가 feature FAC를 추적 가능 → spec coverage self-audit 기반 확보 (ADR-037).

## 참고
- ADR-026 (TASK_TEMPLATE schema)
- ADR-035 (DISCOVERY.md living doc)
- ADR-022 (Ratchet Principle — [관측됨+외부실증] 라벨)
