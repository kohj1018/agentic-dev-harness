# ADR-031 — 비웹 스택을 기본 자동화 직접 지원 범위 밖으로 명시

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- 본문 `## 결정`의 범위 밖 목록에서 **Flutter는 Amendment 1로 제외**됐다 — Flutter(Android·iOS)는 ADR-059의 직접 지원 프로파일을 따른다. 목록의 나머지는 그대로 유효하다.
- `## fork 사용자 override 절차`의 `--override`는 **구현 surface가 없는 미구현 절차**다(Amendment 1). 범위 밖 스택은 project ADR로 본 ADR을 supersede하는 경로를 쓴다.

## 배경
- 본 보일러플레이트는 단순성 1순위(ADR-006) + multi-tool 호환(ADR-010)을 정체성으로 한다.
- 모든 스택(mobile / ML / embedded / game / desktop)을 *기본 자동화의 직접 지원*으로 다루려 하면 DESIGN_SYSTEM·ARCHITECTURE 그룹이 비대화되고, 검증 도구(`validate`)·정적 분석(ADR-021) 권장이 스택별로 분기 폭증한다.
- *명시적 범위 한정 + override 경로*가 *암묵적 빈자리*보다 fork 직후 불일치 발견 시간을 단축한다.
- **"지원하지 않는다"가 아니라 "기본값으로 최적화하지 않는다"** — 본 ADR이 fork 사용자에게 *거부감*을 주지 않도록 표현을 명확히 한다.

## 결정
보일러플레이트의 *기본 자동화 + 문서 템플릿*이 직접 다루는 범위:
- web frontend (React/Next.js/Vue/Svelte/Astro 등)
- API server (FastAPI/Express/Spring/Django/Rails 등)
- CLI (Rust/Go/Python/Node 기반)
- monorepo (turbo/nx/pnpm 등으로 위 3종 결합)
- Supabase 통합 (BaaS의 대표 케이스)

기본 자동화 범위 밖 (override 경로 제공):
- mobile native (iOS Swift/Android Kotlin/RN/Flutter)
- ML/data science (Jupyter/training pipeline)
- embedded / firmware
- game (Unity/Unreal/Godot)
- desktop (Electron 외 native — Electron은 web frontend 범주)

## fork 사용자 override 절차
fork 사용자가 기본 자동화 범위 밖 스택으로 진행하려면:
1. `/bootstrap-stack`이 본 ADR을 인용하며 *"기본 자동화 직접 지원 범위 밖입니다. 직접 보강이 필요합니다"* 출력.
2. 사용자가 `--override` 발화 시 stack-guard 출력 무시, 사용자가 ARCHITECTURE 7섹션(7-1/7-2/7-3/7-4 포함)·DESIGN.md(UI 한정)·검증 도구를 자유 작성.
3. 본 ADR을 인용하며 fork 프로젝트 안에 supersede ADR(예: `ADR-100-rn-stack.md`)을 박음 — *지원하지 않는다*가 아니라 *기본값 최적화 안 함*이라 override는 정상 경로다.

## 결과
- ARCHITECTURE/DESIGN.md 자리 부재가 *결정으로 정리*된다(자리를 만들지 않는 결정).
- `validate` JS-bias 등의 비웹 마찰점이 *override 경로 + 기본 자동화 범위 명시*로 정리된다.

## 후속 작업
없음

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-stack/SKILL.md          — 스택 조합 평가 시 직접지원 유형 정합 확인
- .claude/skills/bootstrap-design/SKILL.md         — 컴포넌트 시작점 표의 override 표기
- .claude/skills/stack-guard/SKILL.md              — 비-Node/범위밖-스택 adapter 경로
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md
- AGENTS.md
- README.md
- README_ko.md

## 참고
- ADR-022 (Ratchet Principle — enabling 정책으로 분류, [외부실증] 라벨)

<a id="adr-031-amend-1"></a>
## Amendment 1 (2026-07-28) — Flutter를 직접 지원 범위로 이관

### 결정
본문 `## 결정`의 *기본 자동화 범위 밖* 목록에서 **Flutter를 제외**한다. Flutter(Android·iOS 타깃)는 ADR-059가 정의하는 직접 지원 프로파일을 따른다. 목록의 나머지(iOS Swift / Android Kotlin / RN / ML·data science / embedded·firmware / game / desktop native)는 변경 없다.

`## fork 사용자 override 절차`의 `--override` 항목은 **구현 surface가 없는 미구현 절차**임을 명시한다. 범위 밖 스택으로 진행하려는 fork 사용자는 플래그가 아니라 **자기 project ADR을 발행해 본 ADR을 supersede**하는 경로를 쓴다.

### 근거
- [관측됨] `--override`는 본 ADR 본문 외 어디에도 존재하지 않으며 이를 처리하는 skill이 없다.
- [관측됨] 본 ADR에 `## Surfaces` 블록이 없어 참조 정합 검사가 이 결손을 검출하지 못했다. 본 amendment에서 함께 신설한다.

### 강도 (ADR-022)
- enabling(약) — 범위 표기 정정 + 미구현 절차 명시.
