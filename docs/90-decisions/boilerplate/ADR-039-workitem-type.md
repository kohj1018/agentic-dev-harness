# ADR-039 — Workitem Type 분류

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] FEATURE_TEMPLATE는 `## 2. 사용자 가치 (User Story)`(persona + benefit)를 요구한다. 그래서 순수 기술 작업(분석 SDK 추가, 로깅, 의존성 업그레이드, CI), 버그픽스, 대형 리팩토링, 스택 마이그레이션, 리서치 스파이크는 워크아이템 체계에 *1급 자리가 없다* → M1-foundation에 욱여넣거나 억지 User Story를 발명하게 된다.
- [관측됨] 트러블슈팅(증상만 있고 AC가 없는 작업)은 `repair-workitem`(이미 알려진 검증 실패 수정)과 다른 흐름인데 전용 자리가 없다.
- [외부실증] Conventional Commits의 `fix`/`refactor`/`chore`/`build`/`ci` 타입, dual-track agile의 enabler 개념 — 작업 종류 어휘는 이미 표준화돼 있다.

## 결정
1. `TASK_TEMPLATE.md`와 `FEATURE_TEMPLATE.md`에 선택 필드 **`Type:`** 를 추가한다. 값: `feature | technical-enabler | bugfix | refactor | migration | research-spike`. 미기재 시 기본 `feature`.
2. 타입별 규칙:
   - **feature**: User Story 필수(기존 그대로).
   - **technical-enabler**: User Story 대신 *기술적 근거(Technical rationale)* 한 줄 + *어떤 가정/기회/상위 결정을 서비스하는지* 링크(DISCOVERY assumption/insight ID 또는 ADR). 시나리오는 "N/A — 내부".
   - **bugfix**: TASK `## 3. 구현 항목` 대신 트러블슈팅 sub-template(증상/재현/기대·실제/관측/가설/root cause/회귀 테스트 AC)을 채운다. AC는 *회귀 방지 테스트* 형태.
   - **refactor**: 외부 행동 불변 명시. AC는 "행동 동일 + 구조 개선 측정"(예: 중복 N→1, 함수 길이↓). ADR-006 Surgical Changes 정합.
   - **migration**: bootstrap-stack `--migrate` contract(ADR-041)와 연결. 단독 마이그레이션 task는 expand-contract 단계를 `## 3`에 명시.
   - **research-spike**: 산출은 코드가 아니라 *리서치 노트*(research-pack, ADR-040)와 연결. TDD opt-out 기본(사유=탐색, follow-up=후속 구현 task).
3. `/plan-workitem`이 `Type:`을 읽어 분해·self-check를 라우팅한다(ADR-026 정합 — 적용 surface는 plan-workitem SKILL).

## 근거
- 새 skill/agent를 늘리지 않고 *필드 1개*로 작업 종류 분류 → 단순성 1순위(ADR-006).
- 트러블슈팅을 `bugfix` task로 흡수해, 반복 빈도가 충분히 쌓이면 그때 `diagnose-workitem` skill로 승격(YAGNI — 지금 새 skill은 과설계).

## 결과
- 두 템플릿에 `Type:` 줄 + technical-enabler/bugfix 분기 주석.
- plan-workitem이 type 인식(적용 surface: plan-workitem SKILL의 Type 라우팅 단락).

## Ratchet 강도 (ADR-022)
- enabling (약, [관측됨]+[외부실증]) — 필드는 *선택적*, 미기재 시 기본 feature. 자동 차단 X.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md        — #d1 §0-1 Type 필드 + 분기 주석
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md     — #d1 §0-1 Type 필드
- .claude/skills/plan-workitem/SKILL.md                — #d3 Type 라우팅 단락

## 참고
- ADR-026 (plan-workitem TASK_TEMPLATE schema), ADR-041 (migration contract), ADR-040 (research capability), ADR-006 (단순성·Surgical Changes).
