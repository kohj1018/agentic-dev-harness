# ADR-042 — UX 흐름 품질 (HEART signals)

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- FEATURE `## 8-1` 신설(결정 1)과 흐름 점검을 기존 시나리오·8상태 self-check 에 맡기는 것(결정 3)은 그대로 유효하다.
- 결정 2 는 **#amend-2 가 정정**했다 — 금지 대상은 *별도 그릇(문서·표·디렉터리) 신설*이며, 그릇을 읽고 채우는 **소비자는 `analyst` agent 가 소유**한다(ADR-062).
- `## 8-1` 의 "copy 톤" 은 DESIGN.md §10 참조 + feature delta 만(#amend-1).
- `## 8-1` 은 지표에 더해 **계측 필드**(이벤트·발생 지점·속성·도구)를 갖는다(#amend-2 결정 3).
- `## 14` Evidence Log 의 `confidence` 판정 기준은 `analyst` 가 소유한다(#amend-2 결정 4).
- `Needs Instrumentation` 자동 위임의 정의는 **ADR-062 D10 이 소유**하고 본 ADR 은 인용한다(#amend-2 결정 5).

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

<a id="adr-042-amend-2"></a>
## Amendment 2 (2026-08-05) — 정량 소비자 자리 신설 (결정 2 문구 정정)

### 배경
- [관측됨] Amendment 1 이 관측한 *"§8-1은 downstream 소비자 0인 죽은 필드"* 의 원인은 필드 설계가 아니라 **소비자 부재**다. 본문 결정 2 의 *"별도 UX 파이프라인 만들지 않음"* 은 **그릇(문서·표·디렉터리) 신설 금지**를 의도했으나, 실제로는 *소비자 신설 금지*로 작동해 `## 14` Evidence Log 의 `quant` 항목을 읽고 `## 15` Insight 로 승격하는 주체가 없었다.
- [관측됨] `## 8-1` 은 *지표*만 적고 **그 지표를 무엇으로 어떻게 측정하나**(이벤트·발생 지점·속성·도구)를 적는 자리가 없다. 데이터는 소급 수집이 불가능하므로 이 정보는 feature 계획 시점에 있어야 한다.
- [관측됨] `## 14` 의 `confidence` 컬럼(상/중/하)에 판정 기준이 정의된 곳이 없다.

### 결정
1. **본문 결정 2 를 다음으로 정정한다** — "별도 **그릇**(문서·표·디렉터리)을 만들지 않는다. `## 14`/`## 15`/`## 12`/`## 13` 을 그대로 쓴다. 단 그 그릇을 채우고 읽는 **소비자**는 `analyst` agent 가 소유한다([ADR-062](ADR-062-domain-advisory-capability.md))."
2. `## 14` Evidence Log 의 `quant` 행을 해석해 `## 15` Insight 로 승격 제안하는 주체는 `/discover-product --update`(정성 지향)가 아니라 **`analyst`** 다. `--update` 는 정성 증거(qual)와 `analyst` 가 반환한 인사이트를 받아 적는다.
3. **`FEATURE_TEMPLATE ## 8-1` 에 `계측` 필드 1개를 추가한다** — 이벤트명·발생 지점·속성·도구를 한 줄에 담는다. 필드를 2개로 쪼개지 않는다(Amendment 1 이 관측한 미충족 위험을 키우지 않는다).
4. `## 14` 의 `confidence` 판정 기준은 `analyst` 가 소유한다 — `상`=실험 설계 + n 충분 / `중`=관측 데이터 + n 충분 / `하`=n 부족 또는 편향 의심.
5. **`Needs Instrumentation` 자동 위임** — 정의·조건·발화 위치는 **[ADR-062](ADR-062-domain-advisory-capability.md) D10 이 소유**하고 본 항은 인용만 한다(같은 트리거를 두 ADR 이 완결 서술하면 다음 개정에서 갈라진다 — ADR-005). **본 ADR 이 소유하는 것은 그 위임의 *결과*가 `## 8-1` 계측 필드를 채운다는 사실뿐이며, 트리거 본문은 여기에 재서술하지 않는다.**
6. **`## 8-1` 의 작성 주체를 `/plan-milestone` R4 로 명시한다.** 현재 R4 불릿은 `## 0-1`/`## 3`/`## 10`/`## 7`/`## 7-1`/`## 11` 만 지시하고 `## 8-1` 을 언급하지 않는다 — #amend-1 이 관측한 "죽은 필드"의 원인은 소비자 부재만이 아니라 **작성 지시 부재**이기도 하다. 소비자만 만들고 작성 주체를 두지 않으면 필드는 계속 빈다.

### 적용 surface
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md  (§8-1 계측 필드)
- .claude/skills/plan-milestone/SKILL.md            (**R4** — `## 8-1` 작성 지시 + `Needs Instrumentation` 위임)
- .claude/skills/plan-workitem/SKILL.md             (계측 스펙 → task `## 3` line item 전달 — 결정 3)
- .claude/skills/discover-product/SKILL.md          (`--update` 의 quant 처리를 `analyst` 경유로 — 결정 2)
- .claude/agents/analyst.md                          (소비자 + confidence 기준 소유)

### 강도 (ADR-022)
- enabling(약) — 필드 1개 추가 + 소비자 지정. 자동 차단 없음. 결정 3 의 "별도 UX self-check 미신설" 은 그대로 유효하다.
