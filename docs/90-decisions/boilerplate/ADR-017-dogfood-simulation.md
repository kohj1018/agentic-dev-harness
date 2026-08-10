# ADR-017 — Dogfood 시뮬레이션 의무 + 재실행 트리거

> scope: boilerplate

## Status
accepted

## 배경
- [가설→실증] 본 보일러플레이트의 fork 사례 0건이라 모든 P0 결정이 [가설] 카테고리. 시뮬레이션 1회 통과가 [가설] → [관측됨] 승격의 단일 경로.
- [관측됨] Phase 1 Round 1 시뮬레이션 결과 — 마찰점 4건 회수 (pnpm 버전 호환 / lock file whitelist / ESM 모듈 캐시 / ARCHITECTURE ## 7 스택 미정 혼란).
- Drew Breunig "Implement to learn" — *"짓고 측정"*이 [가설]을 [관측됨]으로 전환하는 단일 경로.

## 결정

### 1. 시뮬레이션 dogfood 1회 의무
본 보일러플레이트를 개선할 때 **8단계 lifecycle 1회 시뮬레이션**을 baseline 측정으로 의무화한다.
- 시나리오: **todo CLI** (CRUD + JSON persistence) — calculator는 stateless·single-function이라 lifecycle의 모든 결정 포인트를 자극하지 못함.
- 실행 위치: 별도 fork 디렉터리 (`dogfood-<scenario>/`).

### 2. 성공 기준 3개
시뮬레이션이 gate 통과로 인정되려면 다음 3개를 모두 충족:
- 사용자 개입 ≤ 1회 (skill 산출물에 직접 편집 행위 기준 — 질문 응답 제외)
- 산출물 placeholder 충원율 ≥ 80%
- graduation pre-check 미통과 사유 ≤ 2개

### 3. 산출물
`.boilerplate/validation/SIMULATION_RUN.md` (Record 타입, 회차별 누적. fork 사용자 영역 아님)
- 형식: `## Round N (YYYY-MM-DD, scenario)` 헤더로 누적.
- 내용: 단계별 마찰점 / 성공 기준 충족 여부 / 결정에 미친 영향.

### 4. 재실행 트리거 3종
다음 중 1개 발생 시 Round N+1 실행:
1. 새 ADR 도입 (사소한 문구 수정·typo 제외 — amendment 포함)
2. lifecycle 단계 변경 (skill 흐름 재정의)
3. skill 본문 큰 변경 (핵심 수행 항목 추가·삭제)

### 5. 실패 처리
gate 미통과 시:
- 발견된 lifecycle 깨짐을 ADR 후보로 즉시 박는다.
- Phase 2~8 우선순위만 재조정 (작업 자체는 진행).

## Round 1 결과 요약 (2026-05-15, todo CLI / Node+TS+Vitest)
- 사용자 개입: 1회 ≤ 1 ✓
- 충원율: ~89% ≥ 80% ✓
- graduation 미통과 사유: 0건 ≤ 2 ✓
- **결과: 통과** → Phase 2 진행

상세 기록: [SIMULATION_RUN.md](../../../.boilerplate/validation/SIMULATION_RUN.md)

## 후속 작업
- Phase 12 (Round 2) — 본 가이드 Phase 3~9 개선 완료 후 v2 회귀 시뮬레이션 실행.
- Round 2 delta가 본 가이드의 evidence base.

## Amendment 1 (2026-05-16) — 산출물 위치 .boilerplate/로 이동

### 결정
산출물(`SIMULATION_RUN.md`)을 `docs/40-validation/`에서 `.boilerplate/validation/`로 이동한다.

- 새 경로: `.boilerplate/validation/SIMULATION_RUN.md`
- presence: `boilerplate-only` (STRUCTURE.md *보일러플레이트 메타 산출물* 표 참조).
- fork 사용자 영역(`docs/40-validation/`)과 분리 — fork 사용자의 QA_FINDINGS / IMPROVEMENT_GUIDE와 동거하지 않음.

### 근거
- 본 산출물은 *보일러플레이트 자체 dogfood 기록*이지 fork 사용자 프로젝트의 책임 산출물이 아님.
- fork 사용자 시야에서 *맥락 오염*(예: Round 1 todo CLI 기록을 자기 프로젝트 산출물로 오인) 차단.
- 보일러플레이트 신뢰성 증명 자료로 보존 가치 있어 *삭제 X, 위치 이동 O*.

### 결과
- 본 ADR 본문 *3. 산출물* 단락과 *상세 기록 링크*의 경로 갱신.
- STRUCTURE.md *보일러플레이트 메타 산출물* 별도 표 신설 + 산출물 본래 표에서 행 제거.
- README.md / README_ko.md 디렉터리 트리에 `.boilerplate/` 1행 추가 (read-only 안내).

## 참고
- ADR-022 (Ratchet Principle — [가설→실증] 라벨)
- ADR-067 (milestone graduation)
