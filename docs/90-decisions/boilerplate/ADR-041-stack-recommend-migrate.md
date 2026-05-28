# ADR-041 — 스택 추천(--recommend) + 마이그레이션 contract(--migrate)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] `/bootstrap-stack`은 "프로젝트 스택이 명확해진 이후"를 전제한다 — 확정 *전* 추천 자리가 없어 사용자가 스택을 즉흥 선택한다.
- [관측됨] 스택 변경(마이그레이션) 시 old/new/호환/cutover/rollback/검증/hook 갱신을 묶는 contract가 없다. ARCH 7-x·stack-guard verify는 재실행으로 갱신되나 *왜·어떻게* 기록이 없다.
- [외부실증] expand-contract(parallel change) 마이그레이션 패턴 — 점진 cutover + dual-run + cleanup.

## 결정
1. **`--recommend` 모드** (스택 확정 전): PROJECT_CHARTER `## 6 목표`/`## 7 비목표`/`## 8 성공 기준`/`## 9 제약`/ARCH `## 8 품질 속성`(규모·성능·확장 기대)을 읽어 **2~3개 스택 조합 + tradeoff**를 제시. 각 조합에 (a) 현재 복잡도, (b) 확장·마이그레이션 비용, (c) ADR-031 직접지원 5유형 정합, (d) 마이그레이션 경로("X로 시작 → Y로 성장")를 명시. **ADR-006 단순성 가중**(과한 스택 경고). 최신 프레임워크 지형 그라운딩이 필요하면 *사전에 `/research-pack`* 으로 insights 노트를 만들어 참조한다(bootstrap-stack은 fork+Agent 미보유라 직접 위임 X). 출력 → 사용자 선택 → 기존 bootstrap-stack 본 흐름 진행. 파일 자동 생성 X(추천 텍스트만).
2. **`--migrate` 모드**: 새 ADR(또는 ADR-101 supersede)에 마이그레이션 contract를 기록 — old stack / new stack / 호환성(데이터·API·런타임) / cutover 순서(expand-contract) / rollback / validation(검증 기준) / hook·verify 갱신 목록. 이후 `/bootstrap-stack`(스택 정보 갱신)·`/stack-guard`(verify 재생성, 도구 감지 우선순위로 기존 도구 보존) 재실행을 안내.

## 근거
- 추천·마이그레이션은 고-tradeoff 결정 → architect agent(본 skill의 기존 agent)에 적합. 새 skill 없이 *플래그 2개*로 확장(단순성).

## 결과
- `.claude/skills/bootstrap-stack/SKILL.md`에 --recommend/--migrate 단락.

## Ratchet 강도 (ADR-022)
- enabling(약) — 새 모드, opt-in. 추천은 텍스트만(자동 생성 X).

## 참고
- ADR-031(직접지원 5유형), ADR-006(단순성), ADR-040(researcher 그라운딩), ADR-025(외부 의존 권장).
