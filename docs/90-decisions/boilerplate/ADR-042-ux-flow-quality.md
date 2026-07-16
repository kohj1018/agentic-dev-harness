# ADR-042 — UX 흐름 품질 (HEART signals)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] DESIGN.md는 *시각*(color/type/layout/components/motion/8상태)을 강하게 다루지만, *UX 흐름 품질*(흐름 레벨 사용성·상태·접근성·copy·지표)은 Charter 핵심 흐름 + Feature 시나리오 + edge + NFR까지만 — feature 단위로 흐름 품질을 명시할 자리가 약하다. reviewer `design` surface도 *시각 일관성*이지 UX가 아니다.
- [외부실증] Google HEART 프레임워크(Happiness/Engagement/Adoption/Retention/Task success → 목표→신호→지표 매핑), Web Vitals(field measurement가 실제 UX 포착에 필요).

## 결정
1. `FEATURE_TEMPLATE.md`에 **`## 8-1. UX 흐름 품질`** subsection 신설(§8 NFR 직후): primary task / empty·loading·error 흐름 / accessibility / copy 톤 / success metric(HEART signal 1개 — 목표→신호→지표). 비-UI feature는 "(해당 없음)".
2. UX 지표(§8-1 success metric)는 실사용 데이터로 측정 → DISCOVERY Evidence Log(ADR-035#amend-2)의 `quant` 항목으로 회수 → discovery 루프로 UX 개선 환류. **별도 UX 파이프라인 만들지 않음** — 기존 데이터 루프 재사용.
3. 흐름(empty/loading/error·복구) 점검은 기존 FEATURE 시나리오(ADR-036)·8상태 매트릭스 self-check가 담당한다 — plan-workitem에 별도 UX self-check를 두지 않는다.

## 근거
- 흐름 레벨 UX를 *feature 필드*로 흡수 → 새 skill/agent 없이 단순(ADR-006). 데이터 루프(ADR-035#amend-2)에 UX를 끼워 product/UX 개선을 한 고리로.

## 결과
- FEATURE_TEMPLATE §8-1.

## Ratchet 강도 (ADR-022)
- enabling(약, [외부실증] HEART/Web Vitals) — 필드는 권장(비-UI는 "(해당 없음)"), 자동 차단 X.

## 참고
- ADR-027(시각 디자인 — 본 ADR은 UX 흐름으로 보완), ADR-035#amend-2(Evidence 루프), ADR-036(FEATURE schema).

<a id="adr-042-amend-1"></a>
## Amendment 1 (2026-07-16) — §8-1 copy 톤 필드를 DESIGN.md §10 delta로 재정의
### 결정
FEATURE §8-1의 "copy 톤" 항목은 전역 규칙서 [ADR-056](ADR-056-milestone-experience-contract.md)(결정 8~11)의 DESIGN.md §10을 참조하고 **feature-특이 delta만** 기록한다(전역 규칙 재서술 금지). 근거: [관측됨] §8-1은 downstream 소비자 0인 죽은 필드였고, 전역 자산(존댓말·용어)을 feature 필드에 두면 feature 간 drift가 구조적으로 열린다.
### 적용 surface
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (§8-1 주석)
