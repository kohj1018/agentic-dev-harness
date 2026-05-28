# ADR-005 단일 출처(SSOT) 원칙

> scope: boilerplate

## Status
accepted

## 배경
이 보일러플레이트의 모든 가치(fork 후 안정성, 변경 비용 최소화, 사용자 혼선 최소화)는 같은 사실이 한 곳에서 정의되고 다른 곳은 그것을 참조한다는 단일 출처(Single Source of Truth, 이하 SSOT) 원칙에 달려 있다.

본 ADR 이전 시점의 정적 분석에서 다음과 같은 다중 정의가 발견됐다:
- 문서 계층 정의: 5곳 (CLAUDE.md, TEMPLATE_GUIDE.md, boilerplate-context skill, README.md, README_ko.md)
- 위임 트리거 표: 2곳 (CLAUDE.md, DELEGATION_STRATEGY.md, planner 행 누락 모순 포함)
- 상태값 + 전이 규칙: 4곳
- 모델 ID/별칭 표기: 4곳
- Bootstrap 사용 흐름: 5곳

표현 차이가 누적되면 사용자 혼선을 만들고, 변경 시 어느 한 곳이라도 빠뜨리면 stale로 노출된다.

## 결정
다음 다섯 패턴을 보일러플레이트의 SSOT 운영 방식으로 채택한다.

1. **"정의 1곳, 다른 곳은 링크" 패턴** — 각 사실은 단 하나의 canonical 문서에 정의된다. 다른 문서는 한 줄 요약 + canonical 링크만 둔다. 정의 본문을 복제하지 않는다.
2. **"인덱스 README" 패턴** — `docs/90-decisions/README.md`가 ADR 인덱스를 담는다. 새 ADR 추가 시 README 갱신이 기본 절차.
3. **"산출물 인벤토리" 패턴** — `docs/00-meta/STRUCTURE.md`가 모든 산출물의 위치·생성 주체·라이프사이클을 단일 표로 관리. 신규 산출물은 이 표에 등록.
4. **"정책 = ADR" 패턴** — 보일러플레이트가 도입하는 모든 정책(모델 별칭, 단순성, TDD, commit convention, lifecycle, SSOT 등)은 ADR로 박고, agent/skill 본문에는 정책 설명을 길게 박지 않는다.
5. **"진입 페이지" 패턴** — 도구별 진입점(`AGENTS.md`가 캐노니컬, `CLAUDE.md`는 `@AGENTS.md` import)은 fork된 새 세션이 자동 로드한다. 모든 운영 원칙을 다 박지 않고 목적·권위 있는 문서로의 링크 인덱스·핵심 행동 규율만 둔다. (정책 근거: ADR-010)

Canonical Owner 매핑 표는 `docs/00-meta/STRUCTURE.md`의 "Canonical Owner 매핑(SSOT 부록)" 섹션이 SSOT다.

## 근거
- 변경 비용 비대칭 해소 — 모델 별칭 1개 바꿀 때 4 surface 동시 변경하던 것이 1곳 변경으로 끝난다.
- 표현 drift 방지 — 같은 디렉터리를 어떤 곳은 "운영 원칙"이라 부르고 다른 곳은 "guardrail 철학"이라 부르던 혼선이 사라진다.
- 정책 권위 강화 — 정책이 ADR에 박히면 6개월 뒤 fork한 사용자가 "왜 이 정책인가"를 ADR로 추적할 수 있다.
- README cross-language drift 표면 축소 — README 본문이 짧아지면 ko/en 동기화 부담이 줄어든다.

## 결과
- `docs/00-meta/STRUCTURE.md` 신설.
- `docs/90-decisions/README.md` 신설.
- `CLAUDE.md`, `README.md`, `README_ko.md` 등이 슬림화되어 정의 대신 링크를 사용한다.
- agent 본문은 행동 규율 + ADR 링크 형태로 정리된다.

## 후속 작업
- 새 정책이 도입될 때마다 ADR로 박고 README 인덱스에 한 줄 추가.
- 새 산출물이 도입될 때마다 STRUCTURE.md 인벤토리에 등록.
- agent/skill 본문에 정책 설명이 길게 들어 있으면 ADR 링크로 줄이는 후속 정리.
- `/stabilize-milestone`이 SSOT drift 점검을 수행하도록 후속 항목 검토.
